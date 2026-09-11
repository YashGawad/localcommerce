import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';

export default function MyOrdersPage() {
  const orders = [
    { id: '1084', store: 'Sharma Supermarket', date: 'Oct 24, 2026', total: 240, status: 'Out for Delivery', variant: 'warning' },
    { id: '1072', store: 'Shree Kirana Store', date: 'Oct 20, 2026', total: 580, status: 'Delivered', variant: 'success' },
    { id: '1058', store: 'Sharma Artisanal Bakery', date: 'Oct 14, 2026', total: 190, status: 'Delivered', variant: 'success' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172033' }}>My Orders</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {orders.map((order) => (
          <div
            key={order.id}
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
                <strong style={{ fontSize: '14px', color: '#172033' }}>Order #{order.id}</strong>
                <Badge variant={order.variant} size="sm">{order.status}</Badge>
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                {order.store} • {order.date}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#172033' }}>₹{order.total}</span>
              <Link to={`/orders/${order.id}`}>
                <Button variant="outline" size="sm">Track Order</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
