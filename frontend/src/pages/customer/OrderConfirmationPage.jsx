import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';

export default function OrderConfirmationPage() {
  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', padding: '0 16px' }}>
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>check_circle</span>
        </div>
        <Badge variant="success" size="sm">Order Confirmed</Badge>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172033', marginTop: '12px' }}>Order #1084 Received!</h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
          Sharma Supermarket has received your order and is packing your items.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
          <Link to="/orders/1084">
            <Button variant="primary" icon="location_searching">Track Live Order</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
