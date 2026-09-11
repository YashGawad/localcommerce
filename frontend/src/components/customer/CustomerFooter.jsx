import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../shared/Logo';

export default function CustomerFooter() {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        marginTop: 'auto',
        padding: '32px 16px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginBottom: '32px',
        }}
      >
        <div>
          <Logo variant="customer" to="/" />
          <p style={{ color: '#64748B', fontSize: '13px', marginTop: '12px', lineHeight: 1.6, maxWidth: '280px' }}>
            Empowering independent neighbourhood stores and local merchants with direct-to-consumer digital commerce.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#172033', marginBottom: '12px' }}>
            Shop by Store
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <li><Link to="/store/sharma-supermarket" style={{ color: 'inherit' }}>Sharma Supermarket</Link></li>
            <li><Link to="/store/shree-kirana" style={{ color: 'inherit' }}>Shree Kirana Store</Link></li>
            <li><Link to="/store/sharma-bakery" style={{ color: 'inherit' }}>Sharma Artisanal Bakery</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#172033', marginBottom: '12px' }}>
            For Merchants
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <li><Link to="/business" style={{ color: '#2563EB', fontWeight: 600 }}>Merchant Dashboard</Link></li>
            <li><Link to="/business/products" style={{ color: 'inherit' }}>Manage Catalog</Link></li>
            <li><Link to="/business/orders" style={{ color: 'inherit' }}>Fulfillment Queue</Link></li>
            <li><Link to="/login" style={{ color: 'inherit' }}>Partner Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#172033', marginBottom: '12px' }}>
            Platform Portals
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748B' }}>
            <li><Link to="/admin" style={{ color: 'inherit' }}>Platform Admin Console</Link></li>
            <li><Link to="/delivery" style={{ color: 'inherit' }}>Delivery Partner App</Link></li>
            <li><Link to="/orders" style={{ color: 'inherit' }}>Customer Order Tracking</Link></li>
          </ul>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '16px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: '#94A3B8',
        }}
      >
        <span>&copy; {new Date().getFullYear()} LocalCommerce Technologies Inc. All rights reserved.</span>
        <span>Hyperlocal Direct Merchant Ordering Platform</span>
      </div>
    </footer>
  );
}
