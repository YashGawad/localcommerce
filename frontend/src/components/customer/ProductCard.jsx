import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../shared/Badge';
import Button from '../shared/Button';

/**
 * Reusable Customer Product Card
 * Matches Stitch visual design:
 * Image -> Product Name -> Size/Variant -> Store Tag -> Price & MRP -> Add Button
 */
export default function ProductCard({
  product,
  store,
  storePrice,
  mrp,
  availability = 'In Stock',
  onAddToCart,
}) {
  const [qty, setQty] = useState(0);

  const price = storePrice || (product ? product.mrp - 4 : 50);
  const originalPrice = mrp || (product ? product.mrp : 55);
  const discount = originalPrice > price ? originalPrice - price : 0;
  const isOutOfStock = availability === 'Out of Stock';

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setQty(1);
    if (onAddToCart) onAddToCart(product, store, 1);
  };

  const handleInc = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQty((prev) => prev + 1);
    if (onAddToCart) onAddToCart(product, store, qty + 1);
  };

  const handleDec = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQty((prev) => Math.max(0, prev - 1));
    if (onAddToCart) onAddToCart(product, store, qty - 1);
  };

  const storeSlug = store?.slug || 'shree-kirana';
  const detailUrl = `/store/${storeSlug}/product/${product.id}`;

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
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        position: 'relative',
      }}
      className="product-card"
    >
      {/* Product Image Area */}
      <Link to={detailUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '180px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            overflow: 'hidden',
          }}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                transition: 'transform 0.2s ease',
              }}
              loading="lazy"
            />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#CBD5E1' }}>
              inventory_2
            </span>
          )}

          {/* Discount Chip */}
          {discount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '3px',
                letterSpacing: '0.02em',
              }}
            >
              SAVE ₹{discount}
            </span>
          )}

          {/* Availability Chip if low or out of stock */}
          {isOutOfStock ? (
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '3px',
              }}
            >
              Out of Stock
            </span>
          ) : availability === 'Low Stock' ? (
            <span
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '3px',
                border: '1px solid #FDE68A',
              }}
            >
              Low Stock
            </span>
          ) : null}
        </div>

        {/* Content Body */}
        <div style={{ padding: '14px 14px 10px' }}>
          {/* Brand & Variant */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {product.brand}
            </span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              {product.unit}
            </span>
          </div>

          {/* Product Title */}
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#172033',
              lineHeight: 1.35,
              minHeight: '38px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.title}
          </h3>

          {/* Fulfilling Store Tag */}
          {store && (
            <div
              style={{
                marginTop: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#172554',
                backgroundColor: '#EFF4FF',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 500,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#2563EB' }}>
                storefront
              </span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                {store.name}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Pricing & Add to Cart Footer */}
      <div
        style={{
          padding: '10px 14px 14px',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#172033', letterSpacing: '-0.01em' }}>
              ₹{price}
            </span>
            {originalPrice > price && (
              <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                ₹{originalPrice}
              </span>
            )}
          </div>
          <span style={{ fontSize: '10px', color: '#64748B' }}>Store-direct rate</span>
        </div>

        {/* Add Button / Counter */}
        {isOutOfStock ? (
          <Button variant="ghost" size="sm" disabled style={{ fontSize: '11px', color: '#94A3B8' }}>
            Unavailable
          </Button>
        ) : qty === 0 ? (
          <Button variant="outline" size="sm" onClick={handleAdd} icon="add">
            Add
          </Button>
        ) : (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#172554',
              borderRadius: '4px',
              padding: '2px',
              color: '#FFFFFF',
            }}
          >
            <button
              onClick={handleDec}
              style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
              aria-label="Decrease quantity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>remove</span>
            </button>
            <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>
              {qty}
            </span>
            <button
              onClick={handleInc}
              style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
              aria-label="Increase quantity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
