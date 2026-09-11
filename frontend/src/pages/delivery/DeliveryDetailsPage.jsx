import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';

export default function DeliveryDetailsPage() {
  const { id } = useParams();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172033' }}>Order Delivery #{id || '1084'}</h1>
          <Badge variant="warning" dot>En Route</Badge>
        </div>
        <Link to="/delivery">
          <Button variant="outline" size="sm">Back to Queue</Button>
        </Link>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '24px' }}>
        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
          Turn-by-turn navigation, customer phone dialer, OTP verification at doorstep will be populated in <strong>Batch 12</strong>.
        </p>
      </div>
    </div>
  );
}
