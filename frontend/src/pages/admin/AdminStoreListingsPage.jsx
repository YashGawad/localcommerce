import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { STORE_LISTINGS, GLOBAL_PRODUCTS } from '../../data/products';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminModal from '../../components/admin/AdminModal';

export default function AdminStoreListingsPage() {
  const { stores } = useAdmin();

  // Filters
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('ALL');
  const [selectedStockFilter, setSelectedStockFilter] = useState('ALL');
  const [inspectListing, setInspectListing] = useState(null);

  // Flatten all store listings into a single table with store metadata
  const allListings = useMemo(() => {
    const list = [];
    for (const [storeId, items] of Object.entries(STORE_LISTINGS)) {
      const storeObj = stores.find((s) => s.id === storeId);
      for (const item of items) {
        const globalProd = GLOBAL_PRODUCTS.find((g) => g.id === item.productId);
        list.push({
          ...item,
          id: `${storeId}_${item.productId}`,
          storeId,
          storeName: storeObj ? storeObj.name : storeId,
          storeLocation: storeObj ? storeObj.location : '',
          globalProduct: globalProd,
        });
      }
    }
    return list;
  }, [stores]);

  const filteredListings = useMemo(() => {
    return allListings.filter((l) => {
      if (selectedStoreFilter !== 'ALL' && l.storeId !== selectedStoreFilter) {
        return false;
      }
      if (selectedStockFilter !== 'ALL') {
        const st = l.availability || (l.inStock ? 'In Stock' : 'Out of Stock');
        if (st !== selectedStockFilter) return false;
      }
      return true;
    });
  }, [allListings, selectedStoreFilter, selectedStockFilter]);

  const columns = [
    {
      header: 'Store Merchant',
      key: 'storeName',
      render: (l) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
            {l.storeName}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            {l.storeLocation}
          </div>
        </div>
      ),
    },
    {
      header: 'Canonical Product',
      key: 'globalProduct',
      render: (l) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {l.globalProduct?.image && (
            <img
              src={l.globalProduct.image}
              alt=""
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                objectFit: 'contain',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                padding: '2px',
              }}
            />
          )}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
              {l.globalProduct?.title || l.productId}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              {l.globalProduct?.brand} • {l.globalProduct?.unit}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Store Price vs MRP',
      key: 'storePrice',
      render: (l) => {
        const diff = (l.mrp || 0) - (l.storePrice || 0);
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
                ₹{l.storePrice}
              </span>
              {l.mrp && (
                <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                  ₹{l.mrp}
                </span>
              )}
            </div>
            {diff > 0 && (
              <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 600 }}>
                ₹{diff} merchant discount
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Stock Status',
      key: 'availability',
      render: (l) => (
        <AdminStatusBadge
          status={l.availability || (l.inStock ? 'In Stock' : 'Out of Stock')}
          size="sm"
        />
      ),
    },
    {
      header: 'Delivery SLA',
      key: 'deliveryTime',
      render: (l) => (
        <span style={{ fontSize: '12px', color: '#475569' }}>
          {l.deliveryTime || '25–35 mins'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (l) => (
        <button
          type="button"
          onClick={() => setInspectListing(l)}
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#FFFFFF',
            color: '#2563EB',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Inspect
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AdminPageHeader
        title="Store Listings Audit"
        subtitle="Platform-wide inspection of merchant catalog mappings, pricing variations, and local stock readiness"
        badge={`${allListings.length} Active Listings Across Stores`}
        badgeVariant="info"
      />

      {/* Multi-Tenant Architectural Concept Banner */}
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#2563EB' }}>
            schema
          </span>
          <div style={{ fontSize: '12px', color: '#334155' }}>
            <strong>Catalog Architecture:</strong> Global Product (Universal Identity)
            <span style={{ color: '#94A3B8', margin: '0 6px' }}>→</span>
            Store Listing (Store-Specific Price & Shelf Stock)
            <span style={{ color: '#94A3B8', margin: '0 6px' }}>→</span>
            Customer Storefront Order
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic' }}>
          Merchant-owned operational boundaries protected
        </div>
      </div>

      {/* Filter Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Filter by Store:</span>
          <select
            value={selectedStoreFilter}
            onChange={(e) => setSelectedStoreFilter(e.target.value)}
            style={{
              height: '34px',
              padding: '0 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: '12px',
              color: '#172033',
            }}
          >
            <option value="ALL">All Stores ({allListings.length} listings)</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Stock Status:</span>
          <select
            value={selectedStockFilter}
            onChange={(e) => setSelectedStockFilter(e.target.value)}
            style={{
              height: '34px',
              padding: '0 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: '12px',
              color: '#172033',
            }}
          >
            <option value="ALL">All Stock Levels</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={filteredListings}
        searchPlaceholder="Search store name, product title, SKU..."
        searchFilter={(l, q) => {
          return (
            l.storeName.toLowerCase().includes(q) ||
            l.globalProduct?.title.toLowerCase().includes(q) ||
            l.globalProduct?.brand.toLowerCase().includes(q) ||
            l.productId.toLowerCase().includes(q)
          );
        }}
      />

      {/* Listing Inspection Modal */}
      <AdminModal
        isOpen={Boolean(inspectListing)}
        onClose={() => setInspectListing(null)}
        title="Store Listing Inspection"
        subtitle={`Audit record for ${inspectListing?.globalProduct?.title || ''}`}
        footer={
          <button
            type="button"
            onClick={() => setInspectListing(null)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        }
      >
        {inspectListing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                Store Tenant
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#172033', marginTop: '2px' }}>
                {inspectListing.storeName}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Store ID: {inspectListing.storeId} • Location: {inspectListing.storeLocation}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Store Selling Price</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#172033', marginTop: '2px' }}>
                  ₹{inspectListing.storePrice}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  MRP: ₹{inspectListing.mrp} ({(inspectListing.mrp - inspectListing.storePrice) > 0 ? `${inspectListing.mrp - inspectListing.storePrice} discount` : 'Full MRP'})
                </div>
              </div>

              <div style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Availability Status</div>
                <div style={{ marginTop: '4px' }}>
                  <AdminStatusBadge status={inspectListing.availability || (inspectListing.inStock ? 'In Stock' : 'Out of Stock')} size="md" />
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  Estimated Delivery: {inspectListing.deliveryTime || '25–35 mins'}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Canonical Identity Mapping
              </div>
              <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                Linked to global catalog master ID: <code>{inspectListing.productId}</code> ({inspectListing.globalProduct?.title})
              </div>
            </div>

            <div style={{ padding: '10px 12px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', fontSize: '11px', color: '#92400E' }}>
              <strong>Platform Governance Note:</strong> As a multi-tenant platform operator, LocalCommerce preserves merchant autonomy over local price points and shelf counts. Price adjustments should only be made by the store owner directly.
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
