import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { STORE_LISTINGS } from '../../data/products';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminModal from '../../components/admin/AdminModal';

export default function AdminGlobalProductsPage() {
  const { globalProducts, addGlobalProduct, updateGlobalProduct } = useAdmin();

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingMappedProduct, setViewingMappedProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    sku: '',
    unit: '',
    category: 'bakery-dairy',
    categoryName: 'Bakery & Dairy',
    mrp: '',
    description: '',
    image: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to count how many stores list a canonical product
  const getListingCount = (prodId) => {
    let count = 0;
    for (const listings of Object.values(STORE_LISTINGS)) {
      if (listings.some((l) => l.productId === prodId)) {
        count += 1;
      }
    }
    return count;
  };

  const categories = useMemo(() => {
    const cats = new Set(globalProducts.map((p) => p.categoryName || p.category));
    return Array.from(cats);
  }, [globalProducts]);

  const filteredProducts = useMemo(() => {
    return globalProducts.filter((p) => {
      if (selectedCategory !== 'ALL' && (p.categoryName || p.category) !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [globalProducts, selectedCategory]);

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      brand: '',
      sku: `GLB-${Date.now().toString().slice(-6)}`,
      unit: '1 Unit',
      category: 'groceries',
      categoryName: 'Groceries & Staples',
      mrp: '50',
      description: '',
      image: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      title: prod.title,
      brand: prod.brand,
      sku: prod.sku,
      unit: prod.unit,
      category: prod.category,
      categoryName: prod.categoryName,
      mrp: prod.mrp?.toString() || '',
      description: prod.description || '',
      image: prod.image || '',
    });
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.brand.trim()) return;

    if (editingProduct) {
      updateGlobalProduct(editingProduct.id, {
        ...formData,
        mrp: Number(formData.mrp) || 0,
      });
      showToast(`Updated canonical product: ${formData.title}`);
      setEditingProduct(null);
    } else {
      addGlobalProduct(formData);
      showToast(`Created new canonical product: ${formData.title}`);
      setShowAddModal(false);
    }
  };

  const columns = [
    {
      header: 'Canonical Product',
      key: 'title',
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={p.image}
            alt={p.title}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              objectFit: 'contain',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '2px',
            }}
          />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
              {p.title}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Brand: <strong style={{ color: '#334155' }}>{p.brand}</strong> • {p.unit}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      key: 'categoryName',
      render: (p) => (
        <span
          style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: '#EFF6FF',
            color: '#1E40AF',
            fontWeight: 600,
          }}
        >
          {p.categoryName || p.category}
        </span>
      ),
    },
    {
      header: 'SKU / Barcode',
      key: 'sku',
      render: (p) => (
        <div>
          <code style={{ fontSize: '11px', color: '#172033', fontWeight: 600 }}>{p.sku}</code>
          <div style={{ fontSize: '10px', color: '#94A3B8' }}>EAN-13 Canonical</div>
        </div>
      ),
    },
    {
      header: 'Benchmark MRP',
      key: 'mrp',
      render: (p) => (
        <div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
            ₹{p.mrp}
          </span>
          <div style={{ fontSize: '10px', color: '#64748B' }}>Max Retail</div>
        </div>
      ),
    },
    {
      header: 'Store Adoption',
      key: 'stores',
      render: (p) => {
        const c = getListingCount(p.id);
        return (
          <button
            type="button"
            onClick={() => setViewingMappedProduct(p)}
            style={{
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: c > 0 ? '#F0FDF4' : '#F8FAFC',
              color: c > 0 ? '#15803D' : '#64748B',
              border: `1px solid ${c > 0 ? '#BBF7D0' : '#CBD5E1'}`,
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
              storefront
            </span>
            {c} Stores
          </button>
        );
      },
    },
    {
      header: 'Status',
      key: 'status',
      render: (p) => <AdminStatusBadge status={p.status || 'Active'} size="sm" />,
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            type="button"
            onClick={() => handleOpenEdit(p)}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#1E293B',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 999,
          }}
        >
          {toastMessage}
        </div>
      )}

      <AdminPageHeader
        title="Canonical Global Product Catalog"
        subtitle="Platform-wide master catalog definitions. Merchants link to these items to set their own local store price and inventory."
        badge={`${globalProducts.length} Master SKUs`}
        badgeVariant="info"
        actions={
          <button
            type="button"
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#2563EB',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              add_circle
            </span>
            Add Canonical Product
          </button>
        }
      />

      {/* Notice Card on Multi-Tenant Domain Separation */}
      <div
        style={{
          padding: '12px 18px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '12px',
          color: '#1E40AF',
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '20px', flexShrink: 0 }}>
          info
        </span>
        <div>
          <strong>Multi-Tenant Rule:</strong> Global products define universal identity (Title, Brand, Barcode, Nutrition). Store-specific prices and shelf stock are managed separately in <strong>Store Listings</strong> by each merchant.
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: '#64748B' }}>Category:</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        data={filteredProducts}
        searchPlaceholder="Search product title, brand, SKU..."
        searchFilter={(p, q) => {
          return (
            p.title.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
          );
        }}
      />

      {/* Add / Edit Modal */}
      <AdminModal
        isOpen={showAddModal || Boolean(editingProduct)}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? `Edit ${editingProduct.title}` : 'Add Canonical Global Product'}
        subtitle="Universal product master for network distribution"
      >
        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Product Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Amul Pure Ghee 1L Tin"
              style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Brand *
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Amul"
                style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Unit / Package
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. 1 Litre Tin"
                style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Canonical SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="GLB-AML-1000"
                style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Benchmark MRP (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.mrp}
                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                placeholder="620"
                style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Category
            </label>
            <select
              value={formData.categoryName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  categoryName: e.target.value,
                  category: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                })
              }
              style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
            >
              <option value="Bakery & Dairy">Bakery & Dairy</option>
              <option value="Groceries & Staples">Groceries & Staples</option>
              <option value="Beverages & Drinks">Beverages & Drinks</option>
              <option value="Snacks & Confectionery">Snacks & Confectionery</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Product Image URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
              style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Canonical product specifications and ingredients..."
              style={{ width: '100%', padding: '8px 10px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {editingProduct ? 'Save Changes' : 'Create Canonical Product'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* View Mapped Stores Modal */}
      <AdminModal
        isOpen={Boolean(viewingMappedProduct)}
        onClose={() => setViewingMappedProduct(null)}
        title={`Store Adoption: ${viewingMappedProduct?.title}`}
        subtitle="Merchants currently stocking this canonical product in local inventory"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(() => {
            const listings = [];
            for (const [storeId, items] of Object.entries(STORE_LISTINGS)) {
              const item = items.find((i) => i.productId === viewingMappedProduct?.id);
              if (item) {
                listings.push({ storeId, ...item });
              }
            }

            if (listings.length === 0) {
              return (
                <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                  No merchants currently stock this item.
                </div>
              );
            }

            return listings.map((l, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#172033' }}>
                    {l.storeId === 'store_01'
                      ? 'Sharma Supermarket'
                      : l.storeId === 'store_02'
                      ? 'Shree Kirana & General Store'
                      : l.storeId === 'store_03'
                      ? 'Sharma Artisanal Bakery'
                      : 'Fresh Greens Organics'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Store Price: <strong style={{ color: '#172033' }}>₹{l.storePrice}</strong> (MRP: ₹{l.mrp})
                  </div>
                </div>

                <AdminStatusBadge status={l.availability || (l.inStock ? 'In Stock' : 'Out of Stock')} size="sm" />
              </div>
            ));
          })()}
        </div>
      </AdminModal>
    </div>
  );
}
