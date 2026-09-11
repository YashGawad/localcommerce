import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import { useCatalog } from '../../context/CatalogContext';

export default function BusinessProductDetailsPage() {
  const { id } = useParams();
  const { currentStore, storeProducts, adjustStock, calculateStockStatus } = useCatalog();

  const product = storeProducts.find((p) => p.id === id);

  const [adjustAmount, setAdjustAmount] = useState('1');
  const [feedback, setFeedback] = useState('');

  if (!product) {
    return (
      <div style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172554' }}>Product Not Found</h2>
        <p style={{ color: '#64748B', marginTop: '8px' }}>
          This product listing was not found in {currentStore?.name}.
        </p>
        <Link to="/business/products" style={{ marginTop: '16px', display: 'inline-block' }}>
          <Button variant="primary">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const stockStatus = calculateStockStatus(product.stock, product.lowStockThreshold);

  let stockBadgeVariant = 'success';
  if (stockStatus === 'Low Stock') stockBadgeVariant = 'warning';
  if (stockStatus === 'Out of Stock') stockBadgeVariant = 'danger';

  // Gross Margin Calculations
  const grossMarginRupees = Math.max(0, product.price - (product.cost || 0));
  const grossMarginPercent = product.price > 0
    ? (((product.price - (product.cost || 0)) / product.price) * 100).toFixed(1)
    : 0;

  const handleQuickAdjust = (delta) => {
    const newStock = adjustStock(product.id, delta);
    setFeedback(`Stock updated to ${newStock} units`);
    setTimeout(() => setFeedback(''), 2500);
  };

  const handleCustomAdjust = (isAdd) => {
    const qty = parseInt(adjustAmount, 10);
    if (isNaN(qty) || qty <= 0) return;
    const delta = isAdd ? qty : -qty;
    const newStock = adjustStock(product.id, delta);
    setFeedback(`Stock updated to ${newStock} units`);
    setTimeout(() => setFeedback(''), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* BREADCRUMB & TOP HEADER */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
            <Link to="/business/products" style={{ color: '#64748B', textDecoration: 'none' }}>
              Products
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
            <span style={{ color: '#172554', fontWeight: 600 }}>{product.title}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#000F3F', letterSpacing: '-0.015em', margin: 0 }}>
              {product.title}
            </h1>
            <Badge variant={product.status === 'Active' ? 'success' : 'neutral'} size="sm">
              {product.status}
            </Badge>
            <Badge variant={stockBadgeVariant} size="sm">
              {stockStatus}
            </Badge>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
            SKU: <span style={{ fontFamily: 'monospace', color: '#172554' }}>{product.sku}</span> • {currentStore?.name}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/business/products">
            <Button variant="secondary" icon="arrow_back">
              Products
            </Button>
          </Link>
          <Link to={`/business/products/${product.id}/edit`}>
            <Button variant="primary" icon="edit">
              Edit Product
            </Button>
          </Link>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '8px',
            color: '#065F46',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
          {feedback}
        </div>
      )}

      {/* TWO-COLUMN MERCHANT PRODUCT VIEW */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {/* LEFT COLUMN: PRODUCT SPECS & ECONOMICS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Info Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <img
                src={product.image}
                alt={product.title}
                style={{
                  width: '140px',
                  height: '140px',
                  objectFit: 'cover',
                  borderRadius: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  flexShrink: 0,
                }}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/140x140?text=Product';
                }}
              />

              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: '#2563EB', letterSpacing: '0.04em' }}>
                  {product.categoryName}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172554', margin: '4px 0 8px' }}>
                  {product.title}
                </h2>
                <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Brand: <strong style={{ color: '#172554' }}>{product.brand || 'Unbranded'}</strong></div>
                  <div>Pack Unit: <strong style={{ color: '#172554' }}>{product.unit || 'Standard'}</strong></div>
                  <div>Barcode / EAN: <span style={{ fontFamily: 'monospace', color: '#172554' }}>{product.barcode || 'N/A'}</span></div>
                </div>
              </div>
            </div>

            {product.description && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#172554', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 8px' }}>
                  Product Description
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Economics & Profit Margins Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
                Store Pricing &amp; Margin Breakdown
              </h2>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: parseFloat(grossMarginPercent) >= 15 ? '#ECFDF5' : '#FFFBEB',
                  color: parseFloat(grossMarginPercent) >= 15 ? '#047857' : '#B45309',
                }}
              >
                {grossMarginPercent}% Margin
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Selling Price</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#172554', marginTop: '4px' }}>₹{product.price}</div>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Cost Price</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#64748B', marginTop: '4px' }}>₹{product.cost || 0}</div>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Gross Profit</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#047857', marginTop: '4px' }}>₹{grossMarginRupees}</div>
              </div>
            </div>

            {/* Visual margin bar */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginBottom: '4px' }}>
                <span>Cost: ₹{product.cost || 0} ({100 - parseFloat(grossMarginPercent)}%)</span>
                <span>Margin: ₹{grossMarginRupees} ({grossMarginPercent}%)</span>
              </div>
              <div style={{ height: '8px', borderRadius: '4px', backgroundColor: '#E2E8F0', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${100 - parseFloat(grossMarginPercent)}%`, backgroundColor: '#94A3B8' }} />
                <div style={{ width: `${grossMarginPercent}%`, backgroundColor: '#10B981' }} />
              </div>
            </div>
          </div>

          {/* Universal Catalog Link Info */}
          {product.globalProductId && (
            <div
              style={{
                backgroundColor: '#EFF6FF',
                borderRadius: '12px',
                border: '1px solid #BFDBFE',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#2563EB', fontSize: '22px' }}>
                  verified
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E40AF', margin: 0 }}>
                  Universal Product Master Verified
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: '#1E3A8A', margin: '8px 0 0', lineHeight: 1.5 }}>
                This store listing is mapped to canonical identity <strong>{product.globalProductId}</strong>. All platform customers receive certified brand attributes while purchasing directly from your store stock.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: INVENTORY MANAGEMENT & STORE CONTEXT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Real-time Inventory Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
                Inventory &amp; Stock
              </h2>
              <span className="material-symbols-outlined" style={{ color: '#64748B', fontSize: '20px' }}>
                warehouse
              </span>
            </div>

            <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Current Quantity On Hand
              </div>
              <div
                style={{
                  fontSize: '40px',
                  fontWeight: 800,
                  color: product.stock === 0 ? '#DC2626' : product.stock <= product.lowStockThreshold ? '#D97706' : '#172554',
                  marginTop: '4px',
                }}
              >
                {product.stock} <span style={{ fontSize: '18px', fontWeight: 500, color: '#64748B' }}>units</span>
              </div>
              <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
                Low-stock warning triggers at &le; {product.lowStockThreshold} units
              </div>
            </div>

            {/* Quick adjust presets */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#172554', marginBottom: '10px' }}>
                Quick Stock Adjustment
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(-1)}
                  disabled={product.stock <= 0}
                  style={{
                    padding: '8px 0',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: product.stock <= 0 ? '#CBD5E1' : '#DC2626',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(-5)}
                  disabled={product.stock < 5}
                  style={{
                    padding: '8px 0',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: product.stock < 5 ? '#CBD5E1' : '#DC2626',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: product.stock < 5 ? 'not-allowed' : 'pointer',
                  }}
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(5)}
                  style={{
                    padding: '8px 0',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#059669',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(10)}
                  style={{
                    padding: '8px 0',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#059669',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  +10
                </button>
              </div>

              {/* Custom quantity adjuster */}
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="1"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  style={{
                    width: '70px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleCustomAdjust(false)}
                  disabled={product.stock <= 0}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #FCA5A5',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Deduct
                </button>
                <button
                  type="button"
                  onClick={() => handleCustomAdjust(true)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #A7F3D0',
                    backgroundColor: '#ECFDF5',
                    color: '#047857',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
              Last inventory activity: {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : 'Today'}
            </div>
          </div>

          {/* Store Location & Operations Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: '0 0 16px' }}>
              Store Operations Context
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Assigned Store</span>
                <strong style={{ color: '#172554' }}>{currentStore?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Physical Location</span>
                <span style={{ color: '#172033' }}>{currentStore?.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ color: '#64748B' }}>Aisle / Shelf Location</span>
                <span style={{ color: '#172033', fontWeight: 600 }}>{product.aisle || 'Main Storage Rack'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Customer Delivery Time</span>
                <span style={{ color: '#059669', fontWeight: 600 }}>Instant (20–30 mins)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
