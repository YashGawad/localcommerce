import React from 'react';

export default function AdminKpiCard({
  title,
  value,
  change,
  positive = true,
  icon,
  subtext,
  iconColor = '#2563EB',
  bgColor = '#EFF6FF',
}) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: '#64748B',
          }}
        >
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {icon}
            </span>
          </div>
        )}
      </div>

      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '24px', fontWeight: 800, color: '#172033', letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {change && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: positive ? '#ECFDF5' : '#FEF2F2',
              color: positive ? '#059669' : '#DC2626',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
              {positive ? 'trending_up' : 'trending_down'}
            </span>
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#94A3B8' }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
