import React from 'react';
import { Link } from 'react-router-dom';

/**
 * LocalCommerce Official Brand Logo
 * Matches Stitch visual assets with deep navy box anchor and two-tone wordmark.
 */
export default function Logo({ size = 'medium', variant = 'customer', to = '/' }) {
  const isSmall = size === 'small';

  const content = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
      <div
        style={{
          width: isSmall ? '28px' : '34px',
          height: isSmall ? '28px' : '34px',
          backgroundColor: '#172554',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: isSmall ? '13px' : '15px',
          letterSpacing: '-0.02em',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        LC
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontSize: isSmall ? '15px' : '17px',
            fontWeight: 700,
            color: '#172554',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Local<span style={{ color: '#2563EB' }}>Commerce</span>
        </span>
        {variant === 'business' && (
          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '1px' }}>
            Merchant Console
          </span>
        )}
        {variant === 'admin' && (
          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '1px' }}>
            Admin Console
          </span>
        )}
        {variant === 'delivery' && (
          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '1px' }}>
            Delivery Partner
          </span>
        )}
        {variant === 'customer' && (
          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500, letterSpacing: '0.02em', marginTop: '1px' }}>
            Neighbourhood Market
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', display: 'inline-flex' }}>
        {content}
      </Link>
    );
  }

  return content;
}
