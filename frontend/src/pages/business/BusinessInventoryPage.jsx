import React, { useState, useMemo } from 'react';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import { useCatalog } from '../../context/CatalogContext';

export default function BusinessInventoryPage() {
  const { currentStore, storeProducts, categories, adjustStock, calculateStockStatus } = useCatalog();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'low-stock', 'out-of-stock', 'in-stock'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal for detailed stock adjustment
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [modalMode, setModalMode] = useState('adjust'); // 'adjust' (+/-) or 'set' (exact)
  const [modalValue, setModalValue] = useState('5');
  const [feedback, setFeedback] = useState('');

  // Top Metrics
  const totalTracked = storeProducts.length;
  const inStockCount = storeProducts.filter(
    (p) => p.stock > p.lowStockThreshold
  ).length;
  const lowStockCount = storeProducts.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;
  const outOfStockCount = storeProducts.filter((p) => p.stock === 0).length;

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return storeProducts.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        if (!matchTitle && !matchSku) return false;
      }

      // Category
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Tab
      const status = calculateStockStatus(p.stock, p.lowStockThreshold);
      if (activeTab === 'low-stock' && status !== 'Low Stock') return false;
      if (activeTab === 'out-of-stock' && status !== 'Out of Stock') return false;
      if (activeTab === 'in-stock' && status !== 'In Stock') return false;

      return true;
    });
  }, [storeProducts, searchQuery, selectedCategory, activeTab, calculateStockStatus]);

  const handleInlineQuickAdjust = (productId, delta) => {
    const newStock = adjustStock(productId, delta);
    setFeedback(`Stock updated to ${newStock} units`);
    setTimeout(() => setFeedback(''), 2500);
  };

  const handleOpenModal = (product) => {
    setSelectedProductForModal(product);
    setModalMode('adjust');
    setModalValue('5');
  };

  const handleApplyModalAdjustment = (e) => {
    e.preventDefault();
    if (!selectedProductForModal) return;

    const val = parseInt(modalValue, 10);
    if (isNaN(val)) return;

    let newStock;
    if (modalMode === 'set') {
      newStock = adjustStock(selectedProductForModal.id, Math.max(0, val), true);
    } else {
      newStock = adjustStock(selectedProductForModal.id, val, false);
    }

    setFeedback(`Updated ${selectedProductForModal.title} stock to ${newStock} units.`);
    setSelectedProductForModal(null);
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* PAGE HEADER */}
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
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#000F3F',
              letterSpacing: '-0.015em',
              margin: 0,
            }}
          >
            Inventory Management
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
            Track real-time stock levels, reorder alerts, and adjust inventory for {currentStore?.name}.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '14px 18px',
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
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
          {feedback}
        </div>
      )}

      {/* 4 INVENTORY METRIC TILES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
            Total Items Tracked
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#172554', marginTop: '4px' }}>
            {totalTracked}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
            Active SKUs in store
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#059669' }}>
            In Stock Items
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: '4px' }}>
            {inStockCount}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
            Healthy stock buffer
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#D97706' }}>
            Low Stock Alerts
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#D97706', marginTop: '4px' }}>
            {lowStockCount}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
            At or below threshold
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#DC2626' }}>
            Out of Stock
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#DC2626', marginTop: '4px' }}>
            {outOfStockCount}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
            Requires reordering
          </div>
        </div>
      </div>

      {/* CONTROLS BAR: TABS, SEARCH, CATEGORY FILTER */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: activeTab === 'all' ? 700 : 500,
                borderRadius: '6px',
                backgroundColor: activeTab === 'all' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'all' ? '#172554' : '#64748B',
                border: 'none',
                cursor: 'pointer',
                boxShadow: activeTab === 'all' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              All Items ({totalTracked})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('low-stock')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: activeTab === 'low-stock' ? 700 : 500,
                borderRadius: '6px',
                backgroundColor: activeTab === 'low-stock' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'low-stock' ? '#D97706' : '#64748B',
                border: 'none',
                cursor: 'pointer',
                boxShadow: activeTab === 'low-stock' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('out-of-stock')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: activeTab === 'out-of-stock' ? 700 : 500,
                borderRadius: '6px',
                backgroundColor: activeTab === 'out-of-stock' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'out-of-stock' ? '#DC2626' : '#64748B',
                border: 'none',
                cursor: 'pointer',
                boxShadow: activeTab === 'out-of-stock' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              Out of Stock ({outOfStockCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('in-stock')}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: activeTab === 'in-stock' ? 700 : 500,
                borderRadius: '6px',
                backgroundColor: activeTab === 'in-stock' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'in-stock' ? '#059669' : '#64748B',
                border: 'none',
                cursor: 'pointer',
                boxShadow: activeTab === 'in-stock' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              In Stock ({inStockCount})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#64748B',
                }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Search SKU or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 34px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '7px 10px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                color: '#172033',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* INVENTORY TABLE */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  Product
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  SKU
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  Current Stock
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  Threshold
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', textAlign: 'right' }}>
                  Quick Adjust
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#94A3B8' }}>
                      inventory_2
                    </span>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#172554', marginTop: '8px' }}>
                      No inventory items match criteria
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const status = calculateStockStatus(p.stock, p.lowStockThreshold);

                  let badgeVariant = 'success';
                  if (status === 'Low Stock') badgeVariant = 'warning';
                  if (status === 'Out of Stock') badgeVariant = 'danger';

                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {/* Product */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={p.image}
                            alt={p.title}
                            style={{
                              width: '40px',
                              height: '40px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              backgroundColor: '#E2E8F0',
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/80x80?text=Product';
                            }}
                          />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#172554' }}>
                              {p.title}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {p.unit} • {p.categoryName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#475569' }}>
                        {p.sku}
                      </td>

                      {/* Current Stock */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '16px',
                            fontWeight: 800,
                            color: p.stock === 0 ? '#DC2626' : p.stock <= p.lowStockThreshold ? '#D97706' : '#172554',
                          }}
                        >
                          {p.stock}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '4px' }}>units</span>
                      </td>

                      {/* Threshold */}
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748B' }}>
                        &le; {p.lowStockThreshold} units
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <Badge variant={badgeVariant} size="sm">
                          {status}
                        </Badge>
                      </td>

                      {/* Quick Adjust Buttons */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleInlineQuickAdjust(p.id, -1)}
                            disabled={p.stock <= 0}
                            title="Deduct 1 unit"
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              color: p.stock <= 0 ? '#CBD5E1' : '#DC2626',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: p.stock <= 0 ? 'not-allowed' : 'pointer',
                            }}
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInlineQuickAdjust(p.id, 5)}
                            title="Add 5 units"
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              color: '#059669',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenModal(p)}
                            title="Custom Stock Adjustment"
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #DBEAFE',
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>tune</span>
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST STOCK MODAL */}
      {selectedProductForModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#172554', margin: 0 }}>
                  Adjust Inventory
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>
                  {selectedProductForModal.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductForModal(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <span style={{ fontSize: '13px', color: '#64748B' }}>Current Stock:</span>
              <strong style={{ fontSize: '15px', color: '#172554' }}>
                {selectedProductForModal.stock} units
              </strong>
            </div>

            <form onSubmit={handleApplyModalAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Mode Toggle */}
              <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => setModalMode('adjust')}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    fontSize: '12px',
                    fontWeight: modalMode === 'adjust' ? 700 : 500,
                    borderRadius: '6px',
                    backgroundColor: modalMode === 'adjust' ? '#FFFFFF' : 'transparent',
                    color: modalMode === 'adjust' ? '#172554' : '#64748B',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Add / Deduct (+/-)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalMode('set');
                    setModalValue(String(selectedProductForModal.stock));
                  }}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    fontSize: '12px',
                    fontWeight: modalMode === 'set' ? 700 : 500,
                    borderRadius: '6px',
                    backgroundColor: modalMode === 'set' ? '#FFFFFF' : 'transparent',
                    color: modalMode === 'set' ? '#172554' : '#64748B',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Set Exact Count
                </button>
              </div>

              {/* Value Input */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172554', marginBottom: '6px' }}>
                  {modalMode === 'adjust' ? 'Units to Add (Positive) or Deduct (Negative)' : 'New Total Stock Quantity'}
                </label>
                <input
                  type="number"
                  value={modalValue}
                  onChange={(e) => setModalValue(e.target.value)}
                  min={modalMode === 'set' ? '0' : undefined}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  Inventory cannot drop below zero. Stock status will automatically update.
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedProductForModal(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <Button variant="primary" type="submit">
                  Save Stock Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
