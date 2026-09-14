import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import { useCatalog } from '../../context/CatalogContext';

export default function BusinessProductsPage() {
  const {
    currentStore,
    storeProducts,
    categories,
    calculateStockStatus,
    loadingCatalog,
    catalogError,
  } = useCatalog();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Compute KPI summary counts
  const totalCount = storeProducts.length;
  const activeCount = storeProducts.filter((p) => p.status === 'Active').length;
  const lowStockCount = storeProducts.filter(
    (p) => p.stock > 0 && p.stock <= p.lowStockThreshold
  ).length;
  const outOfStockCount = storeProducts.filter((p) => p.stock === 0).length;

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return storeProducts
      .filter((p) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          if (!matchTitle && !matchSku && !matchBrand) return false;
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (p.category !== selectedCategory) return false;
        }

        // Status filter
        if (selectedStatus !== 'all') {
          const invStatus = calculateStockStatus(p.stock, p.lowStockThreshold);
          if (selectedStatus === 'Active' && p.status !== 'Active') return false;
          if (selectedStatus === 'Draft' && p.status !== 'Draft') return false;
          if (selectedStatus === 'Inactive' && p.status !== 'Inactive') return false;
          if (selectedStatus === 'Low Stock' && invStatus !== 'Low Stock') return false;
          if (selectedStatus === 'Out of Stock' && invStatus !== 'Out of Stock') return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'name-desc') return b.title.localeCompare(a.title);
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'stock-asc') return a.stock - b.stock;
        if (sortBy === 'stock-desc') return b.stock - a.stock;
        return 0;
      });
  }, [storeProducts, searchQuery, selectedCategory, selectedStatus, sortBy, calculateStockStatus]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
            Products
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
            Manage {currentStore?.name}'s product catalog and inventory availability.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/business/products/new">
            <Button variant="primary" icon="add">
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 SUMMARY COUNTER CARDS */}
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
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
            Total Products
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#172554', marginTop: '6px' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
            In store catalog
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
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
            Active Listings
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: '6px' }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
            Live on customer app
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
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
            Low Stock
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#D97706', marginTop: '6px' }}>
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
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
            Out of Stock
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#DC2626', marginTop: '6px' }}>
            {outOfStockCount}
          </div>
          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
            Requires replenishment
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              flex: '1 1 260px',
              maxWidth: '400px',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '12px',
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
              placeholder="Search products by title, SKU, or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 38px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                fontSize: '13px',
                color: '#172033',
                outline: 'none',
              }}
            />
          </div>

          {/* Filters & Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
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

            {/* Status Select */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                color: '#172033',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Listing</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Draft">Draft</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                color: '#172033',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
              <option value="stock-asc">Sort: Stock (Low to High)</option>
              <option value="stock-desc">Sort: Stock (High to Low)</option>
            </select>

            {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCT TABLE */}
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
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProductIds.length === filteredProducts.length
                    }
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  Product
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  SKU
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  Retail Price
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  Stock &amp; Inventory
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                  Status
                </th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingCatalog ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 500 }}>Loading products...</div>
                  </td>
                </tr>
              ) : catalogError ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#DC2626' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#DC2626' }}>
                      error
                    </span>
                    <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: 600 }}>
                      Failed to load products
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                      {catalogError}
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px', textAlign: 'center', color: '#64748B' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#94A3B8' }}>
                      search_off
                    </span>
                    <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: 600, color: '#172554' }}>
                      No products found
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                      Try adjusting your search query or filter selections.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = calculateStockStatus(product.stock, product.lowStockThreshold);
                  const isSelected = selectedProductIds.includes(product.id);

                  let stockVariant = 'success';
                  if (stockStatus === 'Low Stock') stockVariant = 'warning';
                  if (stockStatus === 'Out of Stock') stockVariant = 'danger';

                  return (
                    <tr
                      key={product.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: isSelected ? '#F0F7FF' : 'transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(product.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Product details */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={product.image}
                            alt={product.title}
                            style={{
                              width: '44px',
                              height: '44px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              backgroundColor: '#E2E8F0',
                              border: '1px solid #E2E8F0',
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/88x88?text=Product';
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <Link
                              to={`/business/products/${product.id}`}
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: '#172554',
                                textDecoration: 'none',
                                display: 'block',
                              }}
                            >
                              {product.title}
                            </Link>
                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                              {product.unit} • {product.categoryName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'monospace', color: '#475569' }}>
                        {product.sku}
                      </td>

                      {/* Retail Price */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#172554' }}>
                          ₹{product.price}
                        </div>
                        {product.mrp && product.mrp > product.price && (
                          <div style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                            MRP ₹{product.mrp}
                          </div>
                        )}
                      </td>

                      {/* Stock & Availability */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: 700,
                              color: product.stock === 0 ? '#DC2626' : product.stock <= product.lowStockThreshold ? '#D97706' : '#172033',
                            }}
                          >
                            {product.stock} units
                          </span>
                          <Badge variant={stockVariant} size="sm">
                            {stockStatus}
                          </Badge>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          Alert at &le; {product.lowStockThreshold}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <Badge
                          variant={
                            product.status === 'Active'
                              ? 'success'
                              : product.status === 'Draft'
                              ? 'neutral'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {product.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <Link
                            to={`/business/products/${product.id}`}
                            title="View Product Details"
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              color: '#64748B',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>visibility</span>
                          </Link>
                          <Link
                            to={`/business/products/${product.id}/edit`}
                            title="Edit Product"
                            style={{
                              padding: '6px',
                              borderRadius: '6px',
                              color: '#2563EB',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #DBEAFE',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none',
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                          </Link>
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
    </div>
  );
}
