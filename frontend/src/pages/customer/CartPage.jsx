import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/shared/Button';

export default function CartPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172033' }}>Your Cart (Sharma Supermarket)</h1>
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '24px' }}>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
          Customer Cart Shell ready. Complete multi-item quantity controls, order subtotal breakdown, and store fulfillment rules will be populated in <strong>Batch 4</strong>.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/checkout">
            <Button variant="primary" iconRight="arrow_forward">Proceed to Checkout • ₹240</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
