import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/shared/Button';

export default function CheckoutPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172033' }}>Secure Store Checkout</h1>
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '24px' }}>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
          Customer Checkout Shell ready. Delivery slot selection, address validation, and payment method selector will be populated in <strong>Batch 4</strong>.
        </p>
        <Link to="/order-confirmation">
          <Button variant="primary" iconRight="check_circle">Place Order (Test Flow)</Button>
        </Link>
      </div>
    </div>
  );
}
