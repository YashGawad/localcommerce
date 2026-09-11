import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';

export default function DeliveryDashboardPage() {
  const deliveries = [
    { id: '1084', store: 'Sharma Supermarket', dest: 'Flat 402, Green Acres, Koramangala', distance: '1.2 km', pay: '₹45', status: 'Ready for Pickup' },
    { id: '1087', store: 'Sharma Supermarket', dest: 'Plot 18, 5th Cross, Koramangala', distance: '0.8 km', pay: '₹40', status: 'Assigned' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172033' }}>Delivery Staff Queue</h1>
          <p style={{ fontSize: '13px', color: '#64748B' }}>Active orders assigned for local bike/scooter dispatch</p>
        </div>
        <Badge variant="success" dot>2 Orders in Queue</Badge>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {deliveries.map((d) => (
          <div
            key={d.id}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '15px', color: '#172033' }}>Trip #{d.id}</strong>
                <Badge variant="info" size="sm">{d.status}</Badge>
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                From: <strong>{d.store}</strong> → To: <strong>{d.dest}</strong> ({d.distance})
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#10B981' }}>{d.pay}</span>
              <Link to={`/delivery/orders/${d.id}`}>
                <Button variant="primary" size="sm">Start Trip</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
