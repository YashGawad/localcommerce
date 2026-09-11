import React from 'react';
import Badge from '../shared/Badge';

/**
 * Fulfilling Store Listing Option Card
 * Key LocalCommerce architectural differentiator:
 * Displays individual store pricing, distance, delivery SLAs, and selection radio.
 */
export default function StoreListingCard({
  listing,
  store,
  isSelected,
  onSelect,
}) {
  const isOutOfStock = listing.availability === 'Out of Stock';

  return (
    <div
      onClick={() => !isOutOfStock && onSelect && onSelect(store.id)}
      style={{
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
        border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
        boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
        position: 'relative',
        cursor: isOutOfStock ? 'not-allowed' : 'pointer',
        opacity: isOutOfStock ? 0.6 : 1,
        transition: 'all 0.15s ease',
      }}
    >
      {/* Recommended badge */}
      {listing.isRecommended && (
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            right: '16px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check_circle</span>
          Best Price &amp; Fastest
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        {/* Left: Radio + Store Details */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '240px' }}>
          {/* Radio Indicator */}
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: isSelected ? '5px solid #2563EB' : '2px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              marginTop: '2px',
              flexShrink: 0,
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                {store.name}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', color: '#F59E0B', fontWeight: 700 }}>
                ★ {store.rating} ({store.reviewCount})
              </span>
            </div>

            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              📍 {store.distance} • {store.location}
            </div>

            {/* Delivery & Fulfillment Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px', fontSize: '11px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>bolt</span>
                Delivery: {store.deliveryTime} (₹{store.deliveryFee} or FREE &gt; ₹{store.freeDeliveryAbove})
              </span>

              {store.fulfillmentTypes?.includes('pickup') && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>storefront</span>
                  Pickup ({store.pickupTime || '15 mins'})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Price & Status */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#172033' }}>
              ₹{listing.storePrice}
            </span>
            {listing.mrp > listing.storePrice && (
              <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                ₹{listing.mrp}
              </span>
            )}
          </div>

          <div style={{ marginTop: '4px' }}>
            <Badge
              variant={isOutOfStock ? 'danger' : listing.availability === 'Low Stock' ? 'warning' : 'success'}
              size="sm"
            >
              {listing.availability}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
