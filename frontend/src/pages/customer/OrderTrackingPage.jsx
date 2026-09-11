import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';

export default function OrderTrackingPage() {
  const { id } = useParams();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172033' }}>Order Tracking #{id || '1084'}</h1>
          <p style={{ fontSize: '13px', color: '#64748B' }}>Sharma Supermarket • Estimated arrival: 18 mins</p>
        </div>
        <Badge variant="warning" dot>Out for Delivery</Badge>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '24px' }}>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
          Live order tracking steps (Confirmed → Packed → Out for Delivery → Delivered) will be populated with Stitch layout in <strong>Batch 5</strong>.
        </p>
        <Link to="/orders">
          <Button variant="outline">View All My Orders</Button>
        </Link>
      </div>
    </div>
  );
}
