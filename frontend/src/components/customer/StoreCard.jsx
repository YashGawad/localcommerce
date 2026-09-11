import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../shared/Badge';
import Button from '../shared/Button';

/**
 * Reusable Customer Store Card
 * Showcases independent local merchants with storefront photos, delivery SLAs, and ratings.
 */
export default function StoreCard({ store }) {
  const isClosed = !store.isOpen;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
      className="store-card"
    >
      <Link to={`/store/${store.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* Storefront Photography Banner */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '140px',
            backgroundColor: '#F1F5F9',
            overflow: 'hidden',
          }}
        >
          {store.image ? (
            <img
              src={store.image}
              alt={store.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              loading="lazy"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#94A3B8' }}>storefront</span>
            </div>
          )}

          {/* Open/Closed Badge */}
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
            <Badge variant={store.isOpen ? 'success' : 'neutral'} dot size="sm">
              {store.isOpen ? 'Open Now' : 'Closed'}
            </Badge>
          </div>

          {/* Distance Badge */}
          {store.distance && (
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                backdropFilter: 'blur(4px)',
              }}
            >
              {store.distance}
            </div>
          )}
        </div>

        {/* Store Info Content */}
        <div style={{ padding: '16px 16px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172033', lineHeight: 1.3 }}>
                {store.name}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                {store.category}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#F59E0B', fontWeight: 700, fontSize: '13px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>star</span>
              <span>{store.rating}</span>
            </div>
          </div>

          {/* Delivery Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', fontSize: '12px', color: '#475569' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>electric_moped</span>
              <strong>{store.deliveryTime}</strong>
            </span>
            <span>•</span>
            <span style={{ color: '#64748B' }}>
              Min ₹{store.minOrder}
            </span>
            <span>•</span>
            <span style={{ color: '#10B981', fontWeight: 600 }}>
              Free &gt; ₹{store.freeDeliveryAbove}
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px' }}>
            {store.address}
          </div>
        </div>
      </Link>

      {/* Footer Action */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          gap: '8px',
        }}
      >
        <Link to={`/store/${store.slug}`} style={{ flex: 1, textDecoration: 'none' }}>
          <Button variant="primary" size="sm" fullWidth disabled={isClosed}>
            {isClosed ? 'Opens Tomorrow 8:00 AM' : 'Visit Store'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
